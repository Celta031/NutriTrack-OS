# =============================================================================
# Automated Azure IaaS Provisioning Script — NutriTrack OS
# Parameterized via environment variables or default placeholders
# =============================================================================
$ErrorActionPreference = "Stop"

$RG_NAME    = if ($env:AZURE_RG_NAME)    { $env:AZURE_RG_NAME }    else { "rg-nutritrack-prod" }
$VM_NAME    = if ($env:AZURE_VM_NAME)    { $env:AZURE_VM_NAME }    else { "vm-nutritrack" }
$LOCATION   = if ($env:AZURE_LOCATION)   { $env:AZURE_LOCATION }   else { "eastus" }
$VM_SIZE    = if ($env:AZURE_VM_SIZE)    { $env:AZURE_VM_SIZE }    else { "Standard_B1s" }
$ADMIN_USER = if ($env:AZURE_ADMIN_USER) { $env:AZURE_ADMIN_USER } else { "azureuser" }
$DNS_PREFIX = if ($env:AZURE_DNS_PREFIX) { $env:AZURE_DNS_PREFIX } else { "nutritrack-demo-" + (Get-Date -Format "mmss") }

Write-Host "1. Checking Azure CLI session and registering required Resource Providers..."
az account show --output table
az provider register --namespace Microsoft.Compute --wait
az provider register --namespace Microsoft.Network --wait
az provider register --namespace Microsoft.Storage --wait

Write-Host "2. Creating Resource Group $RG_NAME in $LOCATION..."
az group create --name $RG_NAME --location $LOCATION --output table

Write-Host "3. Provisioning Ubuntu 24.04 LTS VM ($VM_SIZE, 64GB StandardSSD_LRS P6 Disk, Standard Public IP with DNS $DNS_PREFIX)..."
az vm create `
  --resource-group $RG_NAME `
  --name $VM_NAME `
  --location $LOCATION `
  --image Canonical:ubuntu-24_04-lts:server:latest `
  --size $VM_SIZE `
  --admin-username $ADMIN_USER `
  --os-disk-size-gb 64 `
  --storage-sku StandardSSD_LRS `
  --public-ip-sku Standard `
  --public-ip-address-dns-name $DNS_PREFIX `
  --generate-ssh-keys `
  --output json

Write-Host "4. Opening HTTP (80) and HTTPS (443) ports on NSG..."
az vm open-port --resource-group $RG_NAME --name $VM_NAME --port 80,443 --priority 1001 --output table

Write-Host "Done! Domain: https://$DNS_PREFIX.$LOCATION.cloudapp.azure.com"
