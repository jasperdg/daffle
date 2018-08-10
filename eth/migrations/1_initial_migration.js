var Migrations = artifacts.require("./Migrations.sol");
var Damble = artifacts.require("./Damble.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Damble);

};
