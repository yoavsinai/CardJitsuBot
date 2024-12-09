import React from 'react';
import styles from './Navbar.module.css';
import prp from '/cardjitsu.svg';

export default function Navbar() {
    const [open, setOpen] = React.useState(false);

    function toggleMenu() {
        setOpen(!open);
    }

    return (
        <>
            <ul className={styles.navbar}>
                <a href="#home">
                    <img src={prp} alt="cardjitsuimage" className={styles.prp} />
                </a>
                <li className={styles.show}>
                    <a href="#home">CardJitsu Bot</a>
                </li>
                <li>
                    <a href="#donate">Donate</a>
                </li>
                <li>
                    <a href="#support">Support</a>
                </li>
                <li>
                    <a href="#about">About</a>
                </li>
                <li>
                    <a href="#terms-of-service">Terms Of Service</a>
                </li>
                <li>
                    <a href="#privacy-policy">Privacy Policy</a>
                </li>
                <li>
                    <a target="_blank" href="https://top.gg/bot/933071368789065799">
                        Top.gg
                    </a>
                </li>
                <li>
                    <a target="_blank" href="https://www.patreon.com/join/cardjitsubot">
                        Patreon
                    </a>
                </li>
                <li className={styles.right}>
                    <a target="_blank" href="https://discord.com/api/oauth2/authorize?client_id=933071368789065799&permissions=8&scope=bot%20applications.commands">
                        Invite the bot to your server!
                    </a>
                </li>
                <li className={`${styles.right} ${styles.wrapper}`}>
                    <button onClick={toggleMenu}>
                        <svg viewBox="0 0 100 80" width="40" height="40">
                            <rect width="100" height="20"></rect>
                            <rect y="30" width="100" height="20"></rect>
                            <rect y="60" width="100" height="20"></rect>
                        </svg>
                    </button>
                </li>
            </ul>
            {open ? (
                <ul className={styles.collapsed}>
                    <li>
                        <a onClick={toggleMenu} href="#donate">
                            Donate
                        </a>
                    </li>
                    <li>
                        <a onClick={toggleMenu} href="#support">
                            Support
                        </a>
                    </li>
                    <li>
                        <a onClick={toggleMenu} href="#about">
                            About
                        </a>
                    </li>
                    <li>
                        <a onClick={toggleMenu} href="#terms-of-service">
                            Terms Of Service
                        </a>
                    </li>
                    <li>
                        <a onClick={toggleMenu} href="#privacy-policy">
                            Privacy Policy
                        </a>
                    </li>
                    <li>
                        <a target="_blank" href="https://top.gg/bot/933071368789065799">
                            Top.gg
                        </a>
                    </li>
                    <li>
                        <a target="_blank" href="https://www.patreon.com/join/cardjitsubot">
                            Patreon
                        </a>
                    </li>
                    <li className={styles.right}>
                        <a target="_blank" href="https://discord.com/api/oauth2/authorize?client_id=933071368789065799&permissions=8&scope=bot%20applications.commands">
                            Invite the bot to your server!
                        </a>
                    </li>
                </ul>
            ) : (
                ''
            )}
        </>
    );
}
