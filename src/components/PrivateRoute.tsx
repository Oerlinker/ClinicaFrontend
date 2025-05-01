import React, {JSX} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
    children: JSX.Element;
    requiredRole?: string | string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole) {
        const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!requiredRoles.includes(user.rol?.nombre || '')) {
            return <Navigate to="/no-permission" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
