import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Logo = styled.img`
  width: 150px;
  margin-bottom: 30px;
`;

const SidebarContainer = styled.div`
  width: 200px;
  height: 100vh;
  background-color:rgb(218, 250, 252);
  padding-top: 20px;
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledLink = styled(NavLink)`
  width: 100%;
  color: #2c3e50;
  padding: 15px 20px;
  text-decoration: none;
  text-align: center;
  &.active {
    background-color: #34495e;
    color: #ecf0f1;
  }
  &:hover {
    background-color: #34495e;
    color: #ecf0f1;
  }
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <Logo src="/logoVitaSicura.png" alt="Logo Vita Sicura" />
      <StyledLink to="/home">Home</StyledLink>
      <StyledLink to="/dashboard">Dashboard</StyledLink>
      <StyledLink to="/polizze">Polizze</StyledLink>
      <StyledLink to="/chatbot">G.I.A.D.A.</StyledLink>
      <StyledLink to="/assistente-vocale">Assistente STT</StyledLink>
      <StyledLink to="/database">Clienti</StyledLink>
    </SidebarContainer>
  );
};

export default Sidebar;
