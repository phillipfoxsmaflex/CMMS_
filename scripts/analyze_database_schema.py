#!/usr/bin/env python3
"""
Database Schema Analyzer for MMS
Analyzes Java Entity classes to extract database structure
"""

import os
import re
from pathlib import Path
from collections import defaultdict

def parse_entity_file(file_path):
    """Parse a Java Entity file and extract table and column information"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract table name
    table_match = re.search(r'@Table\s*\(\s*name\s*=\s*"([^"]+)"', content)
    entity_match = re.search(r'public\s+class\s+(\w+)', content)
    
    if not entity_match:
        return None
    
    entity_name = entity_match.group(1)
    table_name = table_match.group(1) if table_match else entity_name.lower()
    
    # Skip if not an entity
    if '@Entity' not in content:
        return None
    
    # Extract columns
    columns = []
    
    # Find all field declarations
    field_pattern = r'(?:@Column[^;]*)?(?:@ManyToOne|@OneToOne|@OneToMany|@ManyToMany)?[^;]*?(?:private|protected)\s+(\w+(?:<[^>]+>)?)\s+(\w+);'
    
    for match in re.finditer(field_pattern, content):
        field_type = match.group(1)
        field_name = match.group(2)
        
        # Extract column info
        col_info = {
            'name': field_name,
            'java_type': field_type,
            'nullable': True,
            'column_type': None
        }
        
        # Check for @Column annotation before this field
        before_field = content[:match.start()]
        last_annotation = before_field.rfind('@Column')
        if last_annotation != -1:
            annotation = before_field[last_annotation:match.start()]
            
            # Extract column name
            col_name_match = re.search(r'name\s*=\s*"([^"]+)"', annotation)
            if col_name_match:
                col_info['name'] = col_name_match.group(1)
            
            # Extract nullable
            nullable_match = re.search(r'nullable\s*=\s*(true|false)', annotation)
            if nullable_match:
                col_info['nullable'] = nullable_match.group(1) == 'true'
            
            # Extract column definition
            def_match = re.search(r'columnDefinition\s*=\s*"([^"]+)"', annotation)
            if def_match:
                col_info['column_type'] = def_match.group(1)
            
            # Extract length
            length_match = re.search(r'length\s*=\s*(\d+)', annotation)
            if length_match:
                col_info['length'] = int(length_match.group(1))
        
        # Check for @NotNull
        if '@NotNull' in content[:match.start()][-100:]:
            col_info['nullable'] = False
        
        # Determine SQL type
        if not col_info['column_type']:
            col_info['column_type'] = map_java_to_sql_type(field_type, col_info.get('length'))
        
        # Check if it's a relationship
        if any(rel in content[:match.start()][-200:] for rel in ['@ManyToOne', '@OneToOne', '@ManyToMany', '@OneToMany']):
            col_info['relationship'] = True
            if '@ManyToOne' in content[:match.start()][-200:] or '@OneToOne' in content[:match.start()][-200:]:
                col_info['foreign_key'] = f"{field_name}_id"
        else:
            col_info['relationship'] = False
        
        columns.append(col_info)
    
    return {
        'entity': entity_name,
        'table': table_name,
        'columns': columns
    }

def map_java_to_sql_type(java_type, length=None):
    """Map Java types to SQL types"""
    type_map = {
        'String': f'VARCHAR({length})' if length else 'VARCHAR(255)',
        'Long': 'BIGINT',
        'Integer': 'INTEGER',
        'int': 'INTEGER',
        'long': 'BIGINT',
        'Double': 'DOUBLE PRECISION',
        'double': 'DOUBLE PRECISION',
        'Float': 'REAL',
        'float': 'REAL',
        'Boolean': 'BOOLEAN',
        'boolean': 'BOOLEAN',
        'Date': 'TIMESTAMP',
        'LocalDate': 'DATE',
        'LocalDateTime': 'TIMESTAMP',
        'BigDecimal': 'NUMERIC',
        'byte[]': 'BYTEA'
    }
    
    # Remove generic types
    base_type = re.sub(r'<.*>', '', java_type)
    
    return type_map.get(base_type, 'VARCHAR(255)')

def analyze_models_directory(models_dir):
    """Analyze all entity files in the models directory"""
    entities = []
    
    for java_file in Path(models_dir).glob('*.java'):
        entity_info = parse_entity_file(java_file)
        if entity_info:
            entities.append(entity_info)
    
    return sorted(entities, key=lambda x: x['entity'])

def generate_markdown_doc(entities, output_file):
    """Generate markdown documentation"""
    
    # Group entities by category
    categories = {
        'Core Assets': ['Asset', 'AssetCategory', 'AssetDowntime', 'AssetHotspot'],
        'Work Management': ['WorkOrder', 'WorkOrderCategory', 'WorkOrderHistory', 'WorkOrderConfiguration', 'PreventiveMaintenance', 'Schedule'],
        'Inventory': ['Part', 'PartCategory', 'PartQuantity', 'PartConsumption', 'MultiParts'],
        'Locations': ['Location', 'FloorPlan'],
        'People & Teams': ['OwnUser', 'Team', 'Role', 'Customer', 'Vendor', 'ContractorEmployee'],
        'Monitoring': ['Meter', 'Reading', 'Labor'],
        'Purchasing': ['PurchaseOrder', 'PurchaseOrderCategory', 'AdditionalCost'],
        'System': ['Company', 'CompanySettings', 'GeneralPreferences', 'UiConfiguration', 'Notification'],
        'Checklists & Tasks': ['Checklist', 'Task', 'TaskBase', 'TaskOption'],
        'Workflows': ['Workflow', 'WorkflowAction', 'WorkflowCondition'],
        'Documents': ['Document', 'DocumentPermission', 'File'],
        'Other': []
    }
    
    # Categorize entities
    entity_dict = {e['entity']: e for e in entities}
    categorized = defaultdict(list)
    
    for entity in entities:
        found = False
        for category, entity_list in categories.items():
            if entity['entity'] in entity_list:
                categorized[category].append(entity)
                found = True
                break
        if not found:
            categorized['Other'].append(entity)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('# MMS Postgres Datenbankstruktur\n\n')
        f.write('**Erstellt am:** 2026-01-15  \n')
        f.write('**Zweck:** Übersicht für Grafana Dashboard-Entwicklung\n\n')
        f.write('---\n\n')
        
        # Table of Contents
        f.write('## Inhaltsverzeichnis\n\n')
        for category in categories.keys():
            if category in categorized:
                f.write(f'- [{category}](#{category.lower().replace(" ", "-").replace("&", "")})\n')
        f.write('\n---\n\n')
        
        # Write each category
        for category in categories.keys():
            if category not in categorized or not categorized[category]:
                continue
            
            f.write(f'## {category}\n\n')
            
            for entity in sorted(categorized[category], key=lambda x: x['entity']):
                f.write(f'### {entity["entity"]} (`{entity["table"]}`)\n\n')
                
                # Filter out relationship-only fields for clarity
                data_columns = [c for c in entity['columns'] if not c.get('relationship') or c.get('foreign_key')]
                
                if data_columns:
                    f.write('| Spaltenname | Typ | Nullable | Beschreibung |\n')
                    f.write('|-------------|-----|----------|-------------|\n')
                    
                    for col in data_columns:
                        name = col.get('foreign_key', col['name'])
                        col_type = col['column_type']
                        nullable = '✓' if col['nullable'] else '✗'
                        
                        # Add description based on field name
                        desc = get_field_description(col['name'], entity['entity'])
                        
                        f.write(f'| `{name}` | {col_type} | {nullable} | {desc} |\n')
                
                # Show relationships
                relationships = [c for c in entity['columns'] if c.get('relationship') and not c.get('foreign_key')]
                if relationships:
                    f.write('\n**Beziehungen:**\n')
                    for rel in relationships:
                        f.write(f'- `{rel["name"]}`: {rel["java_type"]}\n')
                
                f.write('\n')
        
        # Add quick reference for Grafana
        f.write('---\n\n')
        f.write('## Wichtige Tabellen für Grafana Dashboards\n\n')
        f.write('### Anlagenüberwachung\n\n')
        f.write('```sql\n')
        f.write('-- Assets mit Details\n')
        f.write('SELECT id, name, custom_id, status, location_id, dashboard_url \n')
        f.write('FROM asset \n')
        f.write('WHERE archived = false;\n\n')
        
        f.write('-- Asset Ausfallzeiten\n')
        f.write('SELECT asset_id, starts_on, ends_on, duration, downtime_reason \n')
        f.write('FROM asset_downtime;\n\n')
        
        f.write('-- Wartungsaufträge\n')
        f.write('SELECT id, title, status, priority, due_date, asset_id, completed_on \n')
        f.write('FROM work_order;\n\n')
        
        f.write('-- Zählerstände\n')
        f.write('SELECT m.id, m.name, r.value, r.reading_date, m.asset_id \n')
        f.write('FROM meter m \n')
        f.write('LEFT JOIN reading r ON r.meter_id = m.id;\n')
        f.write('```\n\n')
        
        f.write('### Kosten & Arbeit\n\n')
        f.write('```sql\n')
        f.write('-- Arbeitszeit pro Auftrag\n')
        f.write('SELECT work_order_id, SUM(duration) as total_hours, SUM(hourly_rate * duration) as cost \n')
        f.write('FROM labor \n')
        f.write('GROUP BY work_order_id;\n\n')
        
        f.write('-- Ersatzteilverbrauch\n')
        f.write('SELECT p.name, pc.quantity, pc.work_order_id, pc.created_at \n')
        f.write('FROM part_consumption pc \n')
        f.write('JOIN part p ON p.id = pc.part_id;\n')
        f.write('```\n\n')

def get_field_description(field_name, entity_name):
    """Get a description for common field names"""
    descriptions = {
        'id': 'Eindeutige ID',
        'name': 'Name',
        'description': 'Beschreibung',
        'created_at': 'Erstellungsdatum',
        'updated_at': 'Aktualisierungsdatum',
        'created_by': 'Erstellt von (User ID)',
        'archived': 'Archiviert?',
        'status': 'Status',
        'priority': 'Priorität',
        'due_date': 'Fälligkeitsdatum',
        'completed_on': 'Abgeschlossen am',
        'custom_id': 'Benutzerdefinierte ID',
        'location_id': 'Standort (Location ID)',
        'asset_id': 'Anlage (Asset ID)',
        'work_order_id': 'Arbeitsauftrag (WorkOrder ID)',
        'dashboard_url': 'Grafana Dashboard URL',
        'dashboard_config': 'Dashboard Konfiguration (JSON)',
        'alerting_dashboard_url': 'Globale Alerting Dashboard URL',
        'starts_on': 'Startzeit',
        'ends_on': 'Endzeit',
        'duration': 'Dauer',
        'value': 'Wert',
        'reading_date': 'Ablesedatum',
        'quantity': 'Menge',
        'cost': 'Kosten',
        'hourly_rate': 'Stundensatz'
    }
    
    return descriptions.get(field_name, '')

if __name__ == '__main__':
    models_dir = '/Users/phillipfox/mms/api/src/main/java/com/grash/model'
    output_file = '/Users/phillipfox/mms/DATENBANK_STRUKTUR.md'
    
    print("Analyzing Java Entity classes...")
    entities = analyze_models_directory(models_dir)
    
    print(f"Found {len(entities)} entities")
    print("Generating documentation...")
    
    generate_markdown_doc(entities, output_file)
    
    print(f"✓ Documentation generated: {output_file}")
