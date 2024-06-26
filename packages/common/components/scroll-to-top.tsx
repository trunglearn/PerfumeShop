import { ArrowUpOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);

    const toggleVisible = () => {
        const scrolled = document.documentElement.scrollTop;
        if (scrolled > 300) {
            setVisible(true);
        } else if (scrolled <= 300) {
            setVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
            /* you can also use 'auto' behaviour
         in place of 'smooth' */
        });
    };
    useEffect(() => {
        window.addEventListener('scroll', toggleVisible);
        return window.addEventListener('scroll', toggleVisible);
    }, []);
    return (
        <div
            className={`${!visible && 'hidden'} z-[888] flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-md`}
            onClick={scrollToTop}
            role="presentation"
        >
            <div>
                <ArrowUpOutlined />
            </div>
        </div>
    );
}

export default ScrollToTopButton;
