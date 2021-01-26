'use strict';

const LYRICS_NOT_FOUND = `<div "class="alert alert-danger" role="alert">
                                No lyrics Found!!
                            </div>`;
const BASE_URL = 'https://api.lyrics.ovh/';

const fetchData = async (SEARCH_URL, resultsElement, callback, mode = 'cors') => {

    const httpHeaders = new Headers();
        httpHeaders.append('pragma', 'no-store');
        httpHeaders.append('cache-control', 'no-store');

    const httpInit = {
        headers: httpHeaders,
        mode: mode
    };

    const overlay = document.querySelector(".overlay");
    overlay.style.display = 'flex';

    fetch(SEARCH_URL, httpInit)
        .then(response => response.json())
        .then(data => callback(data))
        .then(innerHtml => resultsElement.innerHTML = innerHtml )
        .then(() => overlay.style.display = 'none')
        .catch((error) => {
            console.error(error);
            overlay.style.display = 'none'
            resultsElement.innerHTML = LYRICS_NOT_FOUND
        })
}

const init = () => {
    const searchElement = document.getElementById("search-box");
    const submitBtn = document.getElementById("submit-btn");
    const resultsElement = document.getElementById("results");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    searchElement.addEventListener("keyup", (event) => {
        const searchStr = searchElement.value;
        if (searchStr != "") {
            submitBtn.removeAttribute("disabled");
        } else {
            submitBtn.setAttribute("disabled", null);
        }
    });

    submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await fetchData(BASE_URL + 'suggest/' + searchElement.value, resultsElement, generateTable);
    });
}

const generateTable = (lyricsObj) => {
    return `<div>
        <table>
            ${lyricsObj.data.reduce((acc, lyric) => acc +
                `<tr>
                    <td>
                        <div class="lyric">
                            <span class="lyric-detail">
                                <span class="artist">${lyric.artist.name}</span>
                                <span class="title">${lyric.title}</span>
                            </span>
                            <button class="show-lyrics-btn"
                                 onclick='showlyrics("${BASE_URL}v1","${lyric.artist.name}", "${lyric.title}")'>
                                <i class="fa fa-list"></i>
                                <span class="show-lyrics">Show Lyrics</span>
                            </button>
                        </div>
                    </td>
                </tr>`, '')}
        </table>
        <footer>
            <button class="nav-buttons" id="prev-btn">Previous</button>
            <button class="nav-buttons" id="next-btn"
            onclick="fetchData('${lyricsObj.next}', document.getElementById('results'),generateTable, 'no-cors')">Next</button>
        </footer>
    </div>`;
}

const generateLyricsTable = (lyricObj) => `<section>
            ${lyricObj.lyrics.length > 0 ? lyricObj.lyrics.replaceAll("\n", "<span class='lyric-break'>") : 'No Lyrics Found.'}
        <section>`;

const showlyrics = async (link, artist, title) => {
    document.getElementById("results")
        .innerHTML = `<section><h2>${artist}</h2>${title}<div id="lyrics"></div></section>`
    await fetchData(link + '/' + encodeURIComponent(artist) + '/' + encodeURIComponent(title), document.getElementById("lyrics"), generateLyricsTable);
}

const onDOMContentLoaded = callback => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, false)
  } else {
    callback()
  }
}

onDOMContentLoaded(init);