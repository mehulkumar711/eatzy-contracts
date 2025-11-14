# Read the file
$controllerContent = Get-Content -Path apps/order-service/src/orders/orders.controller.ts -Raw

# Replace the broken imports
$controllerContent = $controllerContent -replace "from '@app/shared'", "from '@app/shared'"
$controllerContent = $controllerContent -replace "from '@app/shared'", "from '@app/shared'"
$controllerContent = $controllerContent -replace "from '@app/shared'", "from '@app/shared'"

# Replace multiple imports with one
$controllerContent = $controllerContent -replace "import { JwtAuthGuard } from '@app/shared';(\r?\n)import { Roles } from '@app/shared';(\r?\n)import { RolesGuard } from '@app/shared';", "import { JwtAuthGuard, Roles, RolesGuard } from '@app/shared';"

# Write the file back
Set-Content -Path apps/order-service/src/orders/orders.controller.ts -Value $controllerContent
