import { Container } from './Container';

export default function About() {
    return (
        <Container id="about">
            <div>
                <h1>About</h1>
                <p>
                    This is a bot made by{' '}
                    <a target="_blank" href="https://github.com/SiniMini876?tab=repositories">
                        SiniMini876
                    </a>{' '}
                    Please show your support by joining the{' '}
                    <a target="_blank" href="https://discord.gg/nqzCRg5RRb">
                        support server
                    </a>{' '}
                    and upvoting the bot on{' '}
                    <a target="_blank" href="https://top.gg/bot/933071368789065799">
                        top.gg
                    </a>
                    !
                    <br />
                    And if you want to support me even more, you can donate using{' '}
                    <a target="_blank" href="https://www.patreon.com/join/cardjitsubot">
                        Patreon!
                    </a>{' '}
                    (with patreon you can get the Ninja Suit!)
                </p>
            </div>
        </Container>
    );
}
