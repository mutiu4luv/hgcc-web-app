import React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Paper,
  Badge,
} from "@mui/material";
import {
  Dashboard,
  Chat,
  School,
  Person,
  MoreHoriz,
} from "@mui/icons-material";

const MobileBottomNav = ({
  value,
  onChange,
  onProfile,
  moreActions = [],
  chatUnreadCount = 0,
}) => {
  const [moreAnchor, setMoreAnchor] = React.useState(null);
  const handleNavChange = (_, next) => {
    if (next === "more" || next === "profile") return;
    onChange(next);
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
      }}
      elevation={8}
    >
      <BottomNavigation value={value} onChange={handleNavChange} showLabels>
        <BottomNavigationAction label="Dashboard" value="dashboard" icon={<Dashboard />} />
        <BottomNavigationAction
          label="Chat"
          value="chat"
          icon={
            <Badge color="error" badgeContent={chatUnreadCount}>
              <Chat />
            </Badge>
          }
        />
        <BottomNavigationAction label="Courses" value="courses" icon={<School />} />
        <BottomNavigationAction label="Profile" value="profile" icon={<Person />} onClick={onProfile} />
        <BottomNavigationAction
          label="More"
          value="more"
          icon={<MoreHoriz />}
          onClick={(e) => setMoreAnchor(e.currentTarget)}
        />
      </BottomNavigation>
      <Menu
        anchorEl={moreAnchor}
        open={Boolean(moreAnchor)}
        onClose={() => setMoreAnchor(null)}
      >
        {moreActions.map((item, idx) => (
          <MenuItem
            key={`${item.label}-${idx}`}
            onClick={() => {
              setMoreAnchor(null);
              item.onClick?.();
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};

export default MobileBottomNav;
