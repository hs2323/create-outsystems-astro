(() => { var e = async t => { await (await t())() }; (self.Astro || (self.Astro = {})).only = e; window.dispatchEvent(new Event("astro:only")); window.dispatchEvent(new Event("astro:load"));})();
