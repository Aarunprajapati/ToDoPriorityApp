import React from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            navigate("/");
            console.log("Signed out successfully")
        }).catch((error) => {
            // An error happened.
        });
    }

    const handleLogIn = () => {
        navigate("/login")
    }

    return (
        <>
            <nav>
                <p style={{textAlign: 'center'}}>
                    Welcome to TodoApp!
                </p>

                <div class="row">
                    <div class="column">
                        <button onClick={handleLogIn}>
                            LogIn
                        </button>
                    </div>

                    <div class="column">
                        <button onClick={handleLogout}>
                            LogOut
                        </button>
                    </div>
                </div>

            </nav>
        </>
    )
}

export default Home;