import type { Node, Interaction, ProcessedData } from "../stores/data";

const node = (label: string, display_name: string): Node => ({
  label,
  display_name,
  // TODO: dicebar has an api limit for png, but svg displays weridly in graphology
  image: `https://api.dicebear.com/10.x/glass/png?seed=${encodeURIComponent(label)}`,
});

const follow = (sender: Node, receiver: Node): Interaction => ({ sender, receiver, type: "follow" });
const boost = (sender: Node, receiver: Node): Interaction => ({ sender, receiver, type: "boost" });
const like = (sender: Node, receiver: Node): Interaction => ({ sender, receiver, type: "like" });
const mention = (sender: Node, receiver: Node): Interaction => ({ sender, receiver, type: "mention" });

const sam = node("@sam@example.com", "Sam");
const ally = node("@ally@example.com", "Ally");
const moth = node("@moth@example.com", "Moth");
const whisper = node("@whisper@example.com", "Whisper");
const rio = node("@rio@example.com", "Rio");
const juniper = node("@juniper@example.com", "Juniper");
const brushwitch = node("@brushwitch@example.com", "Brush Witch");
const inkwell = node("@inkwell@example.com", "Inkwell");
const linocut = node("@linocut@example.com", "Linocut Lou");
const canvas = node("@canvas@example.com", "Canvas");
const gouache = node("@gouache@example.com", "Gouache Gal");
const pixelpaw = node("@pixelpaw@example.com", "Pixelpaw");
const artHaus = node("@art_haus@example.com", "Art Haus");
const bashParty = node("@bash_party@example.com", "Bash Party");
const riceGod = node("@rice_god@example.com", "Rice God");
const kernelKaren = node("@kernel_karen@example.com", "Kernel Karen");
const nixTux = node("@nix_tux@example.com", "Nix Tux");
const vimGod = node("@vim_god@example.com", "Vim God");
const serverSide = node("@server_side@example.com", "Server Side");
const april = node("@april@example.com", "April");
const bean = node("@bean@example.com", "Bean");
const ghost = node("@ghost@example.com", "Ghost");
const fern = node("@fern@example.com", "Fern");
const clover = node("@clover@example.com", "Clover");
const moss = node("@moss@example.com", "Moss");
const beats = node("@beats@example.com", "Beats");
const synthLord = node("@synth_lord@example.com", "Synth Lord");
const noise = node("@noise@example.com", "Noise");
const vinyl = node("@vinyl@example.com", "Vinyl");
const djCat = node("@dj_cat@example.com", "DJ Cat");
const fediOg = node("@fedi_og@example.com", "Fedi OG");

export const sampleData: ProcessedData = {
  interaction: [
    // sam's circle
    follow(sam, ally),
    follow(ally, sam),
    follow(sam, moth),
    follow(moth, sam),
    follow(sam, whisper),
    follow(whisper, sam),
    follow(sam, rio),
    follow(rio, sam),
    follow(sam, juniper),
    follow(juniper, sam),
    follow(ally, moth),
    follow(moth, ally),
    follow(ally, rio),
    follow(rio, ally),
    follow(ally, juniper),
    follow(juniper, ally),
    follow(moth, whisper),
    follow(whisper, moth),
    follow(moth, rio),
    follow(rio, moth),
    follow(whisper, juniper),
    follow(juniper, whisper),
    follow(rio, juniper),
    follow(juniper, rio),
    follow(sam, artHaus),
    follow(sam, bashParty),
    follow(sam, fediOg),
    follow(sam, beats),
    follow(fern, sam),
    follow(ghost, sam),
    follow(pixelpaw, sam),
    follow(clover, sam),
    follow(noise, sam),

    // art crowd
    follow(artHaus, brushwitch),
    follow(brushwitch, artHaus),
    follow(artHaus, inkwell),
    follow(inkwell, artHaus),
    follow(artHaus, linocut),
    follow(linocut, artHaus),
    follow(artHaus, canvas),
    follow(canvas, artHaus),
    follow(artHaus, gouache),
    follow(gouache, artHaus),
    follow(artHaus, pixelpaw),
    follow(pixelpaw, artHaus),
    follow(brushwitch, inkwell),
    follow(inkwell, brushwitch),
    follow(brushwitch, linocut),
    follow(linocut, brushwitch),
    follow(brushwitch, pixelpaw),
    follow(pixelpaw, brushwitch),
    follow(brushwitch, gouache),
    follow(gouache, brushwitch),
    follow(brushwitch, canvas),
    follow(canvas, brushwitch),
    follow(inkwell, linocut),
    follow(linocut, inkwell),
    follow(inkwell, pixelpaw),
    follow(pixelpaw, inkwell),
    follow(linocut, gouache),
    follow(gouache, linocut),
    follow(linocut, canvas),
    follow(canvas, linocut),
    follow(pixelpaw, canvas),
    follow(canvas, pixelpaw),
    follow(pixelpaw, gouache),
    follow(gouache, pixelpaw),
    follow(canvas, gouache),
    follow(gouache, canvas),
    follow(whisper, brushwitch),
    follow(brushwitch, whisper),
    follow(whisper, canvas),
    follow(canvas, whisper),

    // tech crowd
    follow(bashParty, riceGod),
    follow(riceGod, bashParty),
    follow(bashParty, kernelKaren),
    follow(kernelKaren, bashParty),
    follow(bashParty, vimGod),
    follow(vimGod, bashParty),
    follow(bashParty, serverSide),
    follow(serverSide, bashParty),
    follow(riceGod, kernelKaren),
    follow(kernelKaren, riceGod),
    follow(riceGod, nixTux),
    follow(nixTux, riceGod),
    follow(riceGod, vimGod),
    follow(vimGod, riceGod),
    follow(kernelKaren, nixTux),
    follow(nixTux, kernelKaren),
    follow(kernelKaren, serverSide),
    follow(serverSide, kernelKaren),
    follow(nixTux, vimGod),
    follow(vimGod, nixTux),
    follow(nixTux, serverSide),
    follow(serverSide, nixTux),
    follow(vimGod, serverSide),
    follow(serverSide, vimGod),
    follow(moth, bashParty),
    follow(bashParty, moth),
    follow(moth, vimGod),
    follow(vimGod, moth),
    follow(fediOg, nixTux),
    follow(nixTux, fediOg),

    // friend group
    follow(april, bean),
    follow(bean, april),
    follow(april, fern),
    follow(fern, april),
    follow(april, clover),
    follow(clover, april),
    follow(april, ghost),
    follow(ghost, april),
    follow(bean, ghost),
    follow(ghost, bean),
    follow(bean, fern),
    follow(fern, bean),
    follow(bean, moss),
    follow(moss, bean),
    follow(ghost, fern),
    follow(fern, ghost),
    follow(ghost, moss),
    follow(moss, ghost),
    follow(fern, clover),
    follow(clover, fern),
    follow(fern, moss),
    follow(moss, fern),
    follow(clover, moss),
    follow(moss, clover),
    follow(juniper, clover),
    follow(clover, juniper),
    follow(rio, moss),
    follow(moss, rio),

    // music crowd
    follow(beats, synthLord),
    follow(synthLord, beats),
    follow(beats, noise),
    follow(noise, beats),
    follow(beats, vinyl),
    follow(vinyl, beats),
    follow(beats, djCat),
    follow(djCat, beats),
    follow(synthLord, noise),
    follow(noise, synthLord),
    follow(synthLord, vinyl),
    follow(vinyl, synthLord),
    follow(noise, djCat),
    follow(djCat, noise),
    follow(vinyl, djCat),
    follow(djCat, vinyl),
    follow(rio, beats),
    follow(beats, rio),
    follow(whisper, noise),
    follow(noise, whisper),
    follow(ally, djCat),
    follow(djCat, ally),

    // veteran
    follow(fediOg, artHaus),
    follow(artHaus, fediOg),
    follow(fediOg, april),
    follow(april, fediOg),
    follow(fediOg, riceGod),

    like(ally, sam),
    like(moth, sam),
    like(whisper, rio),
    like(rio, juniper),
    like(inkwell, brushwitch),
    like(gouache, brushwitch),
    like(pixelpaw, inkwell),
    like(canvas, linocut),
    like(canvas, brushwitch),
    like(kernelKaren, bashParty),
    like(vimGod, riceGod),
    like(serverSide, kernelKaren),
    like(ghost, bean),
    like(clover, april),
    like(moss, fern),
    like(synthLord, beats),
    like(djCat, noise),
    like(vinyl, synthLord),
    like(bean, april),
    like(fern, sam),
    like(noise, whisper),
    like(juniper, ally),

    mention(brushwitch, linocut),
    mention(sam, moth),
    mention(moth, sam),
    mention(april, fern),
    mention(bashParty, riceGod),
    mention(ally, whisper),
    mention(artHaus, pixelpaw),
    mention(nixTux, kernelKaren),
    mention(beats, vinyl),
    mention(ghost, april),
    mention(rio, ally),
    mention(fediOg, sam),
    mention(synthLord, djCat),

    boost(sam, brushwitch),
    boost(ally, sam),
    boost(riceGod, nixTux),
    boost(fediOg, sam),
    boost(whisper, noise),
    boost(kernelKaren, serverSide),
    boost(april, clover),
    boost(moth, beats),
    boost(canvas, gouache),
    boost(rio, juniper),
  ],
};
