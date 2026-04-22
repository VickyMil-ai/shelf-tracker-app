import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected route — redirects to login if no token
function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Protected routes — we'll add these next */}
                {/* <Route path="/shelf" element={<PrivateRoute><Shelf /></PrivateRoute>} /> */}
                {/* <Route path="/add" element={<PrivateRoute><AddItem /></PrivateRoute>} /> */}
                {/* <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} /> */}
            </Routes>
        </BrowserRouter>
    );
}
