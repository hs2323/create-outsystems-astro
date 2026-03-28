(() => { var e = async t => { await (await t())() }; (self.Astro || (self.Astro = {})).load = e; window.dispatchEvent(new Event("astro:load")); })();
