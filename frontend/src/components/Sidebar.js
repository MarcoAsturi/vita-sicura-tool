import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 200px;
  height: 100vh;
  background-color: #2c3e50;
  padding-top: 20px;
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: #ecf0f1;
  font-size: 1.5em;
  margin-bottom: 30px;
`;

const StyledLink = styled(NavLink)`
  width: 100%;
  color: #ecf0f1;
  padding: 15px 20px;
  text-decoration: none;
  text-align: center;
  &.active {
    background-color: #34495e;
  }
  &:hover {
    background-color: #34495e;
  }
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <Title>Vita Sicura</Title>
      <StyledLink to="/analisi-descrittiva">Analisi Descrittiva</StyledLink>
      <StyledLink to="/predizione">Predizione</StyledLink>
      <StyledLink to="/chatbot">Chatbot</StyledLink>
      <StyledLink to="/trascrizione">Trascrizione</StyledLink>
      <StyledLink to="/podcast">Podcast</StyledLink>
      <StyledLink to="/database">Database</StyledLink>
    </SidebarContainer>
  );
};

export default Sidebar;
