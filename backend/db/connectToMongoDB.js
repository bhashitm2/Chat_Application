import mongoose from "mongoose";
import dns from "dns";

// mongodb+srv:// URIs need an SRV lookup, which Node performs by querying the
// first system DNS server directly. When that entry is 127.0.0.1 with no local
// resolver running (common with VPN/adblock software), the lookup is refused
// even though normal hostname resolution works — fall back to public DNS.
if (dns.getServers().includes("127.0.0.1")) {
	dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const connectToMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_DB_URI);
		console.log("Connected to MongoDB");
	} catch (error) {
		console.log("Error connecting to MongoDB", error.message);
	}
};

export default connectToMongoDB;
