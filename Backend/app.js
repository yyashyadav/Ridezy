const dotenv=require('dotenv');
dotenv.config();
// this is the express framework 
const express=require('express');
const cors=require('cors');
const app=express();
const userRoutes=require('./routes/user.routes');
const cookieParser=require('cookie-parser');
const captainRoutes=require('./routes/captain.routes')
const mapRoutes=require('./routes/maps.routes');
const rideRoute=require('./routes/ride.routes');

app.use(cors());
// this is for parsing 
app.use(express.json());
app.use(express.urlencoded({extended:true}))
// middleware to parse cookie 
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.send('Hello World');
});
app.use('/users',userRoutes);
app.use('/captains',captainRoutes);
app.use('/maps',mapRoutes);
app.use('/rides',rideRoute);

module.exports=app;