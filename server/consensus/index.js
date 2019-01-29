const async = require("async")
const Ripple = require("../ripple")

/**
 * Creates a new consensus object
 *
 * @class
 * @constructor
 * @prop 
 */
class Consensus
{
	constructor(processor, express)
	{
		this.consensusInstance = new Ripple(processor, express);
	}

	run()
	{
		this.consensusInstance.run();
	}
}

module.exports = Consensus;