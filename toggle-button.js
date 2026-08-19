const styles = `
*{
margin: 0;
padding: 0;
box-sizing: border-box;
}
body {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    transition: background-color 0.3s ease-in ;
}
#mode-toggler { 
    position: absolute;
    left: -9999px;
}

.container {
    width: 200px;
    height: 90px;
    position: relative;
    display: flex;
    align-items: center;
    padding-top: 4px ;
    padding-inline: 8px;
}

.background {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: cover;
    transition: opacity 0.5s ease-in;
}

.light {
    background-image:url("day.png") ;
    opacity: 1;
    border-radius: 30px;

}
.dark {
    background-image: url("night.jpg");
    opacity: 0;
    border-radius: 30px;
}

.ball {
    position: relative;
    z-index: 10;
    border-radius: 50%;
    margin-left: 8px;
    cursor: pointer;
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    /
}

#mode-toggler:checked ~ .container .light {
    opacity: 0;
   
}

#mode-toggler:checked ~ .container .dark {
    opacity: 1;
    
}

#mode-toggler:checked ~ .container .ball {
    transform: translateX(112px);

}
`;

class ToggleButton extends HTMLElement {
    connectedCallback() {
        this.attachShadow({mode:'open'});


        this.shadowRoot.innerHTML =` 
        <style>${styles}</style>
         <input type="checkbox" id="mode-toggler">
            <div class="container">
                <div class="background light"></div> 
                <div class="background dark"></div> 
                <label for="mode-toggler" class="ball">
                    <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
                    <circle cx="35" cy="35" r="35" fill="White"/>
                    </svg>
                </label>
            </div> 
        `

        const toggler = this.shadowRoot.getElementById('mode-toggler');

// Восстанавливаем тему из localStorage
            if (localStorage.getItem('theme') === 'dark') {
                toggler.checked = true;
                document.body.classList.add('dark-theme');
            } else {
                toggler.checked = false;
                document.body.classList.remove('dark-theme');
            }

            // Сохраняем при изменении
            toggler.addEventListener('change', () => {
                if (toggler.checked) {
                    document.body.classList.add('dark-theme');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.body.classList.remove('dark-theme');
                    localStorage.setItem('theme', 'light');
                }
            });

    }
}

customElements.define('toggle-button', ToggleButton)
