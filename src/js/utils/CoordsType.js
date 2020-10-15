/**
 * @author Fabrizio Giordano (Fab77)
 * Enum for coordinate types.
 * @readonly
 * @enum {{name: string, hex: string}}
 */
const CoordsType = Object.freeze({
  CARTESIAN:   "cartesian",
  SPHERICAL:  "spherical",
  ASTRO: "astro"
});

export default CoordsType;