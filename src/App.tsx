import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AllergyPage from './pages/AllergyPage';
import CaloriePage from './pages/CaloriePage';
import FridgePage from './pages/FridgePage';
import ProfilePage from './pages/ProfilePage';
import { useAuthStore } from './stores/useAuthStore';

const queryClient = new QueryClient();

export default function App() {
  const init = useAuthStore((s) => s.init);

  // Firebase 인증 상태 감지 시작 (앱 최초 실행 시 1회)
  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 보호 라우트 (로그인 필요) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/allergy" element={<AllergyPage />} />
            <Route path="/calories" element={<CaloriePage />} />
            <Route path="/fridge" element={<FridgePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
