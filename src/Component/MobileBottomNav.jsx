import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import {
  Dashboard,
  Chat,
  School,
  Person,
  MoreHoriz,
} from "@mui/icons-material";

const MobileBottomNav = ({ value, onChange, onProfile }) => {
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
      <BottomNavigation value={value} onChange={(_, next) => onChange(next)} showLabels>
        <BottomNavigationAction label="Dashboard" value="dashboard" icon={<Dashboard />} />
        <BottomNavigationAction label="Chat" value="chat" icon={<Chat />} />
        <BottomNavigationAction label="Courses" value="courses" icon={<School />} />
        <BottomNavigationAction label="Profile" value="profile" icon={<Person />} onClick={onProfile} />
        <BottomNavigationAction label="More" value="more" icon={<MoreHoriz />} />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;
