import { FC, ReactNode, useState, useContext } from 'react';
import clsx from 'clsx';
import { SidebarContext } from 'src/contexts/SidebarContext';

import PropTypes from 'prop-types';
import {
  Button,
  Tooltip,
  Badge,
  Collapse,
  ListItem,
  TooltipProps,
  tooltipClasses,
  styled
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandLessTwoToneIcon from '@mui/icons-material/ExpandLessTwoTone';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';

interface DocumentationMenuItemProps {
  children?: ReactNode;
  link?: string;
  icon?: any;
  badge?: string;
  badgeTooltip?: string;
  open?: boolean;
  active?: boolean;
  name: string;
  onClick?: () => void;
}

const TooltipWrapper = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.colors.alpha.trueWhite[100],
    color: theme.palette.getContrastText(theme.colors.alpha.trueWhite[100]),
    fontSize: theme.typography.pxToRem(12),
    fontWeight: 'bold',
    borderRadius: theme.general.borderRadiusSm,
    boxShadow:
      '0 .2rem .8rem rgba(7,9,25,.18), 0 .08rem .15rem rgba(7,9,25,.15)'
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.colors.alpha.trueWhite[100]
  }
}));

const DocumentationMenuItem: FC<DocumentationMenuItemProps> = ({
  children,
  link,
  icon: Icon,
  badge,
  badgeTooltip,
  open: openParent,
  active,
  name,
  onClick,
  ...rest
}) => {
  const [menuToggle, setMenuToggle] = useState<boolean>(openParent);
  const { t }: { t: any } = useTranslation();
  const { closeSidebar } = useContext(SidebarContext);

  const toggleMenu = (): void => {
    setMenuToggle((Open) => !Open);
  };

  const handleClick = (): void => {
    if (onClick) {
      onClick();
    }
    closeSidebar();
  };

  if (children) {
    return (
      <ListItem component="div" className="Mui-children" key={name} {...rest}>
        <Button
          className={clsx({ active: menuToggle })}
          startIcon={Icon && <Icon />}
          endIcon={
            menuToggle ? <ExpandLessTwoToneIcon /> : <ExpandMoreTwoToneIcon />
          }
          onClick={toggleMenu}
          sx={{ textAlign: 'start' }}
        >
          {badgeTooltip ? (
            <TooltipWrapper title={badgeTooltip} arrow placement="right">
              {badge === '' ? (
                <Badge color="primary" variant="dot" />
              ) : (
                <Badge badgeContent={badge} />
              )}
            </TooltipWrapper>
          ) : badge === '' ? (
            <Badge color="primary" variant="dot" />
          ) : (
            <Badge badgeContent={badge} />
          )}
          {t(name)}
        </Button>
        <Collapse in={menuToggle}>{children}</Collapse>
      </ListItem>
    );
  }

  return (
    <ListItem component="div" key={name} {...rest}>
      <Button
        disableRipple
        onClick={handleClick}
        startIcon={Icon && <Icon />}
      >
        {t(name)}
        {badgeTooltip ? (
          <TooltipWrapper title={badgeTooltip} arrow placement="right">
            {badge === '' ? (
              <Badge color="primary" variant="dot" />
            ) : (
              <Badge badgeContent={badge} />
            )}
          </TooltipWrapper>
        ) : badge === '' ? (
          <Badge color="primary" variant="dot" />
        ) : (
          <Badge badgeContent={badge} />
        )}
      </Button>
    </ListItem>
  );
};

DocumentationMenuItem.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  link: PropTypes.string,
  icon: PropTypes.elementType,
  badge: PropTypes.string,
  badgeTooltip: PropTypes.string,
  open: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

DocumentationMenuItem.defaultProps = {
  open: false,
  active: false
};

export default DocumentationMenuItem;