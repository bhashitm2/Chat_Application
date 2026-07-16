import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import { CallContextProvider } from "./context/CallContext.jsx";

// apply the stored theme before first paint so there's no light->dark flash
document.documentElement.classList.toggle("dark", localStorage.getItem("chat-theme") === "dark");

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthContextProvider>
				<SocketContextProvider>
					<CallContextProvider>
						<App />
					</CallContextProvider>
				</SocketContextProvider>
			</AuthContextProvider>
		</BrowserRouter>
	</React.StrictMode>
);
