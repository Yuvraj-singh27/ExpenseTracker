const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/User");

router.post('/signup',async (req,res) =>{
   try{
      const {name ,email,password} = req.body;
      let user = await User.findOne({email});
      if(user){
         return res.status(400).json({message:'User already exists'});

      }

      user = new User({name,email,password});

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password,salt);

      await user.save();
      const token = jwt.sign(
         { userId: user._id },
         process.env.JWT_SECRET,
         { expiresIn: '24h' }
      );
      res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });

   }catch (error) {
    res.status(500).json({ message: 'Server error during signup' });
   }
});



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Match password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;