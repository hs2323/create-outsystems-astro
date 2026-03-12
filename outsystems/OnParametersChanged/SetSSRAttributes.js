const astroIsland = document.querySelector(`astro-island[uid="${$parameters.UID}"]`);
if (astroIsland && !astroIsland.hasAttribute('ssr')) {
    astroIsland.setAttribute('ssr', '');
}
