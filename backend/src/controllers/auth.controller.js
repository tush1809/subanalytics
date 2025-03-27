import { User } from "../models/user.model.js";
import { hash, compare } from "bcrypt";
import { COOKIE_OPTIONS } from "../constants.js";

export async function registerUser(req, res) {
  const { firstname, lastname, email, password } = req.body;
  try {
    const hashedPassword = await hash(password, 10);
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User does not exist" });

    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid login credentials" });

    const accessToken = user.generateAccessToken();

    const loggedInUser = await User.findById(user._id).select("-password");

    res
      .status(200)
      .cookie("accessToken", accessToken, COOKIE_OPTIONS)
      .json({
        message: "User logged in successfully!",
        user: loggedInUser,
        accessToken,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
