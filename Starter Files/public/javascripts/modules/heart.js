import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
    e.preventDefault(); // stop the browser from posting and give it to js
    console.log('heart itt!!!');
    console.log(this);
    axios
        .post(this.action)
        .then(res => { 
            // no need to refresh to see the heart changes
            const isHearted = this.heart.classList.toggle('heart__button--hearted') // this is a form tag and heart is an element inside of the form tag
            $('.heart-count').textContent = res.data.hearts.length;
            if(isHearted) {
                // floating heart
                this.heart.classList.add('heart__button--float');
                setTimeout(() => this.heart.classList.remove('heart__button--float'), 
                2500);
            }
        })
        .catch(console.error);}

export default ajaxHeart;