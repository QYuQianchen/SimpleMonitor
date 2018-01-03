import web3
from web3 import Web3, HTTPProvider
from web3.contract import ConciseContract
import json

device_types = {"house": 0, "pv": 1, "battery": 2, "grid": 3}


web3 = Web3(HTTPProvider('http://localhost:8545'))

artefact_configuration = json.load(open('../build/contracts/Configuration.json'))
adr_configuration = web3.toChecksumAddress("0x5aef01194b7b82bac337a5e42bd10af52a097ccd")
ins_configuration = web3.eth.contract(adr_configuration, abi=artefact_configuration['abi'], ContractFactoryClass=ConciseContract)

config = json.load(open('../src/config.json'))

# ctr_configuration = web3.eth.contract(abi=artefact_configuration["abi"])

i = 0
for device_type in config:
    for element in config[device_type]:
        element["type"] = device_type
        element["device_name"] = "{}{}".format(device_type, element["id"])
        element["address"] = web3.eth.accounts[i]
        print(element)
        i = i+1


for device_type in config:
    for element in config[device_type]:
        if (element["type"] == "grid"):
            ins_configuration.addGrid(element["address"], transact={'from': web3.eth.accounts[0]})
            element["contract_address"] = ins_configuration.getGridAdr()
        elif(element["type"] != "admin"):
            ins_configuration.addDevice(device_types[element["type"]], element["address"], 0, True, transact={'from': web3.eth.accounts[0]})
            element["contract_address"] = ins_configuration.getContractAddress(element["address"])
        print(element)
        

# ins_configuration.addGrid(web3.eth.accounts[1], transact={'from': web3.eth.accounts[0]})

print('Grid contract address: {}'.format(ins_configuration.getGridAdr()))
