import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Shelf from './pages/Shelf';
import AddItem from './pages/AddItem';
import Recommendations from './pages/Recommendations';
import EditItem from './pages/EditItem';

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
                <Route path="/shelf" element={<PrivateRoute><Shelf /></PrivateRoute>} />
                <Route path="/add" element={<PrivateRoute><AddItem /></PrivateRoute>} />
                <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
                <Route path="/edit" element={<PrivateRoute><EditItem /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    );
}
