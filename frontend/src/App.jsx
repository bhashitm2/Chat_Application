import { Navigate, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import CallOverlay from "./components/calls/CallOverlay";
import useTheme from "./zustand/useTheme";
import Preloader from "./components/common/Preloader";

function App() {
	const { authUser } = useAuthContext();
	const { theme } = useTheme();
	const [loading, setLoading] = useState(true);

	// the .dark class on <html> flips every design token (see index.css)
	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

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
		<div className='h-screen flex items-center justify-center p-3 md:p-5'>
			<Routes>
				<Route path='/' element={authUser ? <Home /> : <Navigate to={"/login"} />} />
				<Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
				<Route path='/signup' element={authUser ? <Navigate to='/' /> : <SignUp />} />
			</Routes>
			<CallOverlay />
			<Toaster />
		</div>
	);
}

export default App;
