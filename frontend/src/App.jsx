import { Navigate, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import useTheme from "./zustand/useTheme";
import { THEMES } from "./utils/themes";
import Preloader from "./components/common/Preloader";

function App() {
	const { authUser } = useAuthContext();
	const { theme } = useTheme();
	const currentTheme = THEMES[theme] || THEMES.default;
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 2000);
		return () => clearTimeout(timer);
	}, []);

	if (loading) {
		return <Preloader />;
	}

	return (
		<div className='p-4 h-screen flex items-center justify-center' style={{ background: currentTheme.bgImage, backgroundColor: currentTheme.bgColor }}>
			<Routes>
				<Route path='/' element={authUser ? <Home /> : <Navigate to={"/login"} />} />
				<Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
				<Route path='/signup' element={authUser ? <Navigate to='/' /> : <SignUp />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
