const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MY_PLAYER";

const player = $(".player");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const repeatBtn = $(".btn-repeat");
const randomSongBtn = $(".btn-random");
const playlist = $(".playlist");
const progress = $("#progress");
const volumeInput = $("#volume");


const keyframes = [
    { transform: "rotate(360deg" }
];
const cdThumbAnimate = cdThumb.animate(keyframes, {
    duration: 10000,
    iterations: Infinity
});

const app = {
    songs: [
        {
            id: 1,
            name: "Naachne Ka Shaunq",
            singer: "Raftaar x Brobha V",
            path: "./audios/Naachne-Ka-Shaunq.m4a",
            image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg"
        },
        {
            id: 2,
            name: "Click Pow Get Down",
            singer: "Raftaar x Fortnite",
            path: "./audios/Click-Pow-Get-Down.mp4",
            image: "https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg"
        },
        {
            id: 3,
            name: "Tu Phir Se Aana",
            singer: "Raftaar x Salim Merchant x Karma",
            path: "./audios/Tu-Phir-Se-Aana.mp4",
            image: "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg"
        },
        {
            id: 4,
            name: "Mantoiyat",
            singer: "Raftaar x Nawazuddin Siddiqui",
            path: "./audios/Mantoiyat.m4a",
            image:
                "https://a10.gaanacdn.com/images/song/39/24225939/crop_480x480_1536749130.jpg"
        },
        {
            id: 5,
            name: "Aage Chal",
            singer: "Raftaar",
            path: "./audios/Aage-Chal.m4a",
            image: "https://a10.gaanacdn.com/images/albums/72/3019572/crop_480x480_3019572.jpg"
        },
        {
            id: 6,
            name: "Damn",
            singer: "Raftaar x kr$na",
            path: "./audios/Damn.m4a",
            image: "https://i.ytimg.com/vi/yBRKqRc-vyQ/maxresdefault.jpg"
        },
        {
            id: 7,
            name: "Feeling You",
            singer: "Raftaar x Harjas",
            path: "./audios/Feeling-You.m4a",
            image: "https://a10.gaanacdn.com/gn_img/albums/YoEWlabzXB/oEWlj5gYKz/size_xxl_1586752323.webp"
        }
    ],
    currentIndex: 0,
    currentTime: 0,
    currentVolume: 1,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    songPlayed: new Set(),
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render() {
        const html = this.songs.map((song) => {
            return `
                <div class="song" data-id="${song.id}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        }).join("");
        const playlist = $(".playlist");
        playlist.innerHTML = html;
    },
    handleEvents() {
        const cdWidth = cd.offsetWidth;

        document.onscroll = function (e) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        playBtn.onclick = () => {
            if (this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        audio.onplay = () => {
            player.classList.add("playing");
            this.isPlaying = true;
            cdThumbAnimate.play();
        }

        audio.onpause = () => {
            player.classList.remove("playing");
            this.isPlaying = false;
            cdThumbAnimate.pause();
        }

        audio.ontimeupdate = () => {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
                this.setConfig("currentTime", audio.currentTime);
            }
        }

        progress.oninput = (e) => {
            audio.currentTime = (e.target.value / 100 * audio.duration);
        }

        nextBtn.onclick = () => {
            if (this.isRandom) {
                this.randomSong();
            } else {
                this.nextSong();
            }
            audio.currentTime = 0;
            audio.play();
        }

        prevBtn.onclick = () => {
            if (this.isRandom) {
                this.randomSong();
            } else {
                this.prevSong();
            }
            audio.currentTime = 0;
            audio.play();
        }

        repeatBtn.onclick = () => { this.handleRepeatSong() };
        randomSongBtn.onclick = () => { this.handleRandomSong() };

        audio.onended = () => {
            if (this.isRepeat) {
                // audio.currentTime = 0;
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        playlist.onclick = (e) => {
            const song = e.target.closest(".song:not(.active,.option)");
            if (song) {
                if (!e.target.closest(".option")) {
                    this.currentIndex = song.dataset.id - 1;
                    this.loadCurrentSong();
                    audio.currentTime = 0;
                    audio.play();
                } else {
                    // Do something
                }
            }
        }

        volumeInput.oninput = () => {
            this.currentVolume = volumeInput.value / 100;
            audio.volume = this.currentVolume;
            this.setConfig('currentVolume', this.currentVolume);
        }
    },
    defineProperties() {
        Object.defineProperty(this, "currentSong", {
            get() {
                return this.songs[this.currentIndex];
            }
        });
    },
    loadCurrentSong() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
        audio.currentTime = this.currentTime;
        audio.volume = this.currentVolume;
        this.songPlayed.add(this.songs[this.currentIndex].id);

        this.setConfig('currentIndex', this.currentIndex);

        $(".song.active")?.classList.remove("active");
        $(`.song[data-id='${this.currentSong.id}']`)?.classList.add("active");
        cdThumbAnimate.cancel();

        this.scrollToActiveSong();
    },
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex > this.songs.length - 1) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    handleRepeatSong() {
        this.isRepeat = !this.isRepeat;
        this.setConfig('isRepeat', this.isRepeat);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
    handleRandomSong() {
        this.isRandom = !this.isRandom;
        this.setConfig('isRandom', this.isRandom);
        randomSongBtn.classList.toggle("active", this.isRandom);
    },
    randomSong() {
        do {
            if (this.songPlayed.size >= this.songs.length) this.songPlayed.clear();

            this.currentIndex = Math.floor(Math.random() * this.songs.length);

        } while (this.songPlayed.has(this.songs[this.currentIndex].id));

        this.loadCurrentSong();
    },
    scrollToActiveSong() {
        setTimeout(() => {
            $(".song.active").scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    },
    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        this.currentIndex = this.config.currentIndex;
        this.currentTime = this.config.currentTime;
        this.currentVolume = this.config.currentVolume;

        volumeInput.value = this.currentVolume * 100;
        repeatBtn.classList.toggle("active", this.isRepeat);
        randomSongBtn.classList.toggle("active", this.isRandom);
    },
    start() {
        this.defineProperties();
        this.loadConfig();
        this.handleEvents();
        this.render();
        this.loadCurrentSong();
    }
}
app.start();