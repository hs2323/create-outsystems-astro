(function () { let e = async e => { await (await e())() }; (self.Astro || (self.Astro = {})).only = e, window.dispatchEvent(new Event(`astro:only`)) })();
