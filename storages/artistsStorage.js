class ArtistsStorage {
    constructor() {
        this.storage = {};
        this.id = 0;

        // petit seed (tu peux enlever)
        this.addArtist({
            name: "Sand Ancre",
            city: "Paris",
            styles: ["Fine line", "Floral"],
            instagram: "https://instagram.com/",
        });
    }

    addArtist({ name, city, styles, instagram }) {
        const id = String(this.id);
        this.storage[id] = { id, name, city, styles, instagram };
        this.id++;
    }

    getArtists() {
        return Object.values(this.storage);
    }

    getArtist(id) {
        return this.storage[id];
    }
}

module.exports = new ArtistsStorage();
