import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import SkillsPage from './pages/SkillsPage';
import SkillDetailPage from './pages/SkillDetailPage';
import McpServersPage from './pages/McpServersPage';
import McpDetailPage from './pages/McpDetailPage';
import ScenesPage from './pages/ScenesPage';
import SceneDetailPage from './pages/SceneDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/skills" replace />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="skills/:skillId" element={<SkillDetailPage />} />
          <Route path="mcp-servers" element={<McpServersPage />} />
          <Route path="mcp-servers/:id" element={<McpDetailPage />} />
          <Route path="scenes" element={<ScenesPage />} />
          <Route path="scenes/:id" element={<SceneDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
