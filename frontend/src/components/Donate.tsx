import { Container } from './Container';
import styles from './Donate.module.css';

export default function Donate() {
    return (
        <Container id="donate">
            <div>
                <h1>Donate</h1>
                <p>
                    I am an independent developer and I made this bot for my own enjoyment.<br/>
                    Being able to make this bot better and being a student will be hard enough, and donating me will keep me motivated.<br/>
                    I am not making any money from this bot. If you want to support me, you can donate to me using{' '}
                    <a target="_blank" href="https://www.patreon.com/join/cardjitsubot">
                        Patreon!
                    </a>{' '}
                    (with patreon you can get the Ninja Suit! Which contains 6 OP Cards!) You can also upvote the bot on{' '}
                    <a target="_blank" href="https://top.gg/bot/933071368789065799">
                        top.gg
                    </a>{' '}
                    to get even more cards!
                    It's totally free to upvote the bot and it will help me a lot!
                </p>
                <img
                    src="https://c10.patreonusercontent.com/4/patreon-media/p/reward/9059572/1fda081e6c8d42b5bbb4ce45581fb469/eyJ3Ijo0MDB9/3.png?token-time=2145916800&token-hash=HKiVodmtlyKTnQabRheYjZVsodYx2fd994DQvU6AeVM%3D"
                    alt=""
                    className={styles.patreon}
                />
            </div>
        </Container>
    );
}
