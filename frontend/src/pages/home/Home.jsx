import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";

const Home = () => {
	return (
		<div className='flex w-full max-w-[95vw] h-[90vh] rounded-lg overflow-hidden glass'>
			<Sidebar />
			<MessageContainer />
		</div>
	);
};
export default Home;
