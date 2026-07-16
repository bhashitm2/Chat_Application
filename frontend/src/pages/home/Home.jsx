import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";

const Home = () => {
	return (
		<div className='flex w-full h-full max-w-[1400px] rounded-2xl overflow-hidden bg-panel border border-[color:var(--panel-border)] shadow-frame theme-fade'>
			<Sidebar />
			<MessageContainer />
		</div>
	);
};
export default Home;
