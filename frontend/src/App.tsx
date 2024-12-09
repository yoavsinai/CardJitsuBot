import About from './components/About';
import Donate from './components/Donate';
import Home from './components/Home';
import Navbar from './components/Navbar';
import PrivacyPolicy from './components/PrivacyPolicy';
import Support from './components/Support';
import ToS from './components/ToS';

function App() {
    return (
        <div>
            <Navbar />
            <Home />
            <Donate />
            <Support />
            <About />
            <ToS />
            <PrivacyPolicy />
        </div>
    );
}

export default App;
