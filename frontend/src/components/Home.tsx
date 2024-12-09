import { Container } from './Container';
import styles from './Home.module.css';
import prp from '/cardjitsu.svg';

export default function Home() {
    return (
        <Container id="home">
            <div className={styles.container}>
                <h1>CardJitsu Bot</h1>
                <img src={prp} alt="" className={styles.prp} />
                <p>
                    The Card Jitsu discord bot is ready to launch! Play your favorite club penguin game in discord! A simple bot that lets you play the known Club Penguin's minigame Card Jitsu. The
                    bot allows you to play against friends and the sensei! (which is the bot itself) To change the bot's language please do /setLang in a server (25 languages!).
                </p>
                <p>The bot is currently in beta, so expect bugs and errors. If you find any, please report them in the support server.</p>
                <p className={styles.invite}>
                    <a className={styles.inviteBtn} target="_blank" href="https://discord.com/api/oauth2/authorize?client_id=933071368789065799&permissions=8&scope=bot%20applications.commands">
                        Invite the bot to your server!
                    </a>
                </p>
            </div>
        </Container>
    );
}
