(function () { let e = async e => { await (await e())() }; (self.Astro || (self.Astro = {})).load = e, window.dispatchEvent(new Event(`astro:load`)) })();
