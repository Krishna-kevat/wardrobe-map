const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { getDashboardStats } = require('./controllers/dashboardController');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wardrobe', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB.");

    const req = {};
    const res = {
        json: function (data) {
            console.log("SUCCESS RESPONSE:");
            console.log(JSON.stringify(data, null, 2));
            process.exit(0);
        },
        status: function (code) {
            console.log(`STATUS: ${code}`);
            return this;
        }
    };

    try {
        await getDashboardStats(req, res);
    } catch (err) {
        console.error("FATAL ERROR:", err);
        process.exit(1);
    }
}).catch(err => {
    console.error(err);
    process.exit(1);
});
