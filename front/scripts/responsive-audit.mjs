import { spawn } from "node:child_process"
import { setTimeout as delay } from "node:timers/promises"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createServer } from "node:net"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const frontRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = path.resolve(frontRoot, "..")
const routeGroupsDirectory = path.join(frontRoot, "src", "routes", "groups")
const outputDirectory = path.join(frontRoot, "responsive-audit")
const screenshotsDirectory = path.join(outputDirectory, "screenshots")
const baselinePath = path.join(outputDirectory, "RESPONSIVE_BASELINE.md")
const widths = [320, 360, 390, 640, 768, 1024, 1280, 1440]
const height = 800
const require = createRequire(import.meta.url)
let baseUrl

const routeGroupFiles = [
   ["public auth", "PublicAuthRoutes.tsx"],
   ["user", "UserRoutes.tsx"],
   ["company", "CompanyRoutes.tsx"],
   ["admin", "AdminRoutes.tsx"]
]

const toSamplePath = route =>
   route.replace(/:([^/]+)/g, (_match, name) =>
      name.toLowerCase().includes("slug") ? "audit-sample" : "audit-id"
   )

const readRoutes = async () => {
   const routes = []
   for (const [group, fileName] of routeGroupFiles) {
      const source = await readFile(
         path.join(routeGroupsDirectory, fileName),
         "utf8"
      )
      const seen = new Set()
      for (const match of source.matchAll(/\bpath\s*:\s*["']([^"']+)["']/g)) {
         const route = match[1]
         if (!route.startsWith("/") || seen.has(route)) continue
         seen.add(route)
         routes.push({
            group,
            path: route,
            samplePath: toSamplePath(route),
            role: group === "public auth" ? "public" : group
         })
      }
   }
   return routes
}

const readAdminPermissions = async () => {
   const source = await readFile(
      path.join(frontRoot, "src", "types", "adminPermissions.ts"),
      "utf8"
   )
   return [...source.matchAll(/^\s+[A-Z_]+:\s*"([A-Z_]+)"/gm)].map(
      match => match[1]
   )
}

const reservePort = async () =>
   new Promise((resolve, reject) => {
      const portServer = createServer()
      portServer.once("error", reject)
      portServer.listen(0, "127.0.0.1", () => {
         const address = portServer.address()
         if (!address || typeof address === "string") {
            portServer.close()
            reject(new Error("Could not reserve a local port for Vite."))
            return
         }
         portServer.close(error => {
            if (error) reject(error)
            else resolve(address.port)
         })
      })
   })

const startServer = port => {
   const viteEntry = path.resolve(
      path.dirname(require.resolve("vite")),
      "..",
      "..",
      "bin",
      "vite.js"
   )
   return spawn(
      process.execPath,
      [viteEntry, "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
      { cwd: frontRoot, stdio: "inherit", windowsHide: true }
   )
}

const waitForServer = async server => {
   for (let attempt = 0; attempt < 60; attempt += 1) {
      if (server.exitCode !== null) {
         throw new Error(`Vite exited before becoming ready (${server.exitCode}).`)
      }
      try {
         const response = await fetch(baseUrl)
         if (response.ok) return
      } catch {
         await delay(500)
      }
   }
   throw new Error(`Vite did not become ready at ${baseUrl}.`)
}

const authForRole = (role, adminPermissions) => {
   if (role === "public") return null
   if (role === "company") {
      return {
         companyInfo: {
            id: "responsive-audit-company",
            companyName: "Responsive Audit Company",
            email: "company@example.test",
            logoUrl: "",
            role: "company",
            approvalStatus: "APPROVED"
         }
      }
   }
   return {
      userInfo: {
         id: "responsive-audit-user",
         firstName: "Responsive",
         lastName: "Audit",
         email: "audit@example.test",
         profilePicUrl: "",
         role: role === "admin" ? "ADMIN" : "USER",
         permissions: role === "admin" ? adminPermissions : []
      }
   }
}

const mockApiResponses = async (page, adminPermissions, getActiveRoute) => {
   await page.route("**/api/**", async route => {
      if (!["fetch", "xhr"].includes(route.request().resourceType())) {
         await route.continue()
         return
      }
      const url = new URL(route.request().url())
      let data = []
      const activeRoute = getActiveRoute()

      if (url.pathname.endsWith("/api/admin/me/permissions")) {
         data = { permissions: adminPermissions }
      } else if (
         url.pathname === "/api/professional-profile" ||
         url.pathname.startsWith("/api/professional-profile/")
      ) {
         data = {
            profile: {},
            completion: {
               basicInformation: true,
               certificates: true,
               educations: true,
               experiences: true,
               percentage: 100,
               projects: true,
               skills: true,
               isCompleted: activeRoute.samplePath !== "/profile/complete"
            }
         }
      }

      await route.fulfill({
         status: 200,
         contentType: "application/json",
         body: JSON.stringify({ success: true, data })
      })
   })
}

const measurePage = async page => {
   return page.evaluate(() => {
      const viewportWidth = window.innerWidth
      const scrollWidth = document.documentElement.scrollWidth
      const offenders = [...document.querySelectorAll("body *")]
         .map(element => {
            const rect = element.getBoundingClientRect()
            const style = getComputedStyle(element)
            return {
               tag: element.tagName.toLowerCase(),
               className:
                  typeof element.className === "string"
                     ? element.className.trim().replace(/\s+/g, " ")
                     : "",
               id: element.id,
               right: Math.round(rect.right * 100) / 100,
               position: style.position,
               visible:
                  rect.width > 0 &&
                  rect.height > 0 &&
                  style.display !== "none" &&
                  style.visibility !== "hidden"
            }
         })
         .filter(element => element.visible && element.right > viewportWidth)
         .sort((left, right) => right.right - left.right)
         .slice(0, 5)

      const sidebar =
         document.querySelector("aside") ??
         document.querySelector(".MuiDrawer-paper")
      const main = document.querySelector("main")
      const rectWidth = element =>
         element
            ? Math.round(element.getBoundingClientRect().width * 100) / 100
            : null

      return {
         viewportWidth,
         scrollWidth,
         overflow: Math.max(0, scrollWidth - viewportWidth),
         offenders,
         sidebarWidth: rectWidth(sidebar),
         mainWidth: rectWidth(main),
         bodyTextLength: document.body.innerText.trim().length,
         hasRouterError: document.body.innerText.includes(
            "Unexpected Application Error!"
         ),
         pathname: window.location.pathname
      }
   })
}

const screenshotName = (route, width) => {
   const routeName =
      route.samplePath === "/"
         ? "root"
         : route.samplePath
              .replace(/^\/|\/$/g, "")
              .replace(/[^a-zA-Z0-9]+/g, "-")
   return `${route.group.replace(/\s+/g, "-")}-${routeName}-${width}.png`
}

const summarizeOffenders = results => {
   const summary = new Map()
   for (const result of results.filter(result => !result.skipped)) {
      for (const offender of result.measurement.offenders) {
         const label = offender.id
            ? `#${offender.id}`
            : offender.className
              ? `.${offender.className.split(" ").slice(0, 3).join(".")}`
              : `<${offender.tag}>`
         const current = summary.get(label) ?? { count: 0, maxRight: 0 }
         current.count += 1
         current.maxRight = Math.max(current.maxRight, offender.right)
         summary.set(label, current)
      }
   }
   return [...summary.entries()]
      .sort((left, right) => right[1].count - left[1].count)
      .slice(0, 10)
}

const markdownCell = value => String(value).replace(/\|/g, "\\|")

const writeBaseline = async (routes, results, adminPermissions) => {
   const rows = routes.map(route => {
      const routeResults = widths.map(width =>
         results.find(
            result =>
               result.route.path === route.path &&
               result.route.group === route.group &&
               result.width === width
         )
      )
      const cells = routeResults.map(result => {
         if (!result || result.skipped) return "SKIPPED"
         return result.measurement.overflow
            ? `OVERFLOW(${result.measurement.overflow}px)`
            : "PASS"
      })
      return `| ${markdownCell(route.group)} | \`${route.path}\` | ${cells.join(" | ")} |`
   })

   const offenderRows = summarizeOffenders(results)
   const offenderTable = offenderRows.length
      ? [
           "| Component/selector | Occurrences | Furthest right edge |",
           "|---|---:|---:|",
           ...offenderRows.map(
              ([name, stats]) =>
                 `| \`${markdownCell(name)}\` | ${stats.count} | ${stats.maxRight}px |`
           )
        ].join("\n")
      : "No overflowing element right edges were recorded."

   const overflowDetails = results
      .filter(result => !result.skipped && result.measurement.overflow > 0)
      .flatMap(result =>
         result.measurement.offenders.map(
            offender =>
               `| ${markdownCell(result.route.group)} | \`${markdownCell(result.route.samplePath)}\` | ${result.width}px | tag: \`${markdownCell(offender.tag)}\`; class: \`${markdownCell(offender.className || "none")}\`; id: \`${markdownCell(offender.id || "none")}\` | ${offender.right}px |`
         )
      )
   const overflowDetailsTable = overflowDetails.length
      ? [
           "| Group | Route | Width | Offending element | Bounding right edge |",
           "|---|---|---:|---|---:|",
           ...overflowDetails
        ].join("\n")
      : "No reachable measurements overflowed."

   const layoutRows = ["user", "company"].map(role => {
      const result = results.find(
         item =>
            item.route.role === role &&
            item.width === 390 &&
            !item.skipped &&
            item.measurement.sidebarWidth !== null
      )
      return result
         ? `| ${role} | \`${result.route.samplePath}\` | ${result.measurement.sidebarWidth}px | ${result.measurement.mainWidth ?? "not found"}px | ${result.measurement.scrollWidth - 390}px |`
         : `| ${role} | SKIPPED: no reachable representative route | — | — | — |`
   })

   const skipped = results.filter(result => result.skipped)
   const skippedNotes = skipped.length
      ? [
           "### Skipped measurements",
           "",
           ...skipped.map(
              result =>
                 `- ${result.route.group} \`${result.route.path}\` at ${result.width}px: ${result.reason}`
           )
        ].join("\n")
      : "No routes were skipped."

   const report = `# Responsive baseline\n\nGenerated: ${new Date().toISOString()}\n\n## Method\n\nThe audit read literal route paths from \`src/routes/groups/PublicAuthRoutes.tsx\`, \`UserRoutes.tsx\`, \`CompanyRoutes.tsx\`, and \`AdminRoutes.tsx\`. Parameterized segments use stable sample values. Protected routes were loaded with synthetic localStorage authentication state matching the existing \`token\`, \`userInfo\`, and \`companyInfo\` keys. API requests were intercepted by Playwright and answered with minimal success-shaped fixtures; no backend or real credentials were used. Redirected or failed route loads are marked SKIPPED. Measurements use a viewport height of ${height}px.\n\n## Routes discovered\n\n| Group | Route | Sample path |\n|---|---|---|\n${routes.map(route => `| ${route.group} | \`${route.path}\` | \`${route.samplePath}\` |`).join("\n")}\n\n## Route and viewport results\n\n| Group | Route | ${widths.map(width => `${width}px`).join(" | ")} |\n|---|---|---|\n${rows.join("\n")}\n\n## Top overflowing components overall\n\n${offenderTable}\n\n## User/company layout measurements at 390px\n\n| Role | Sample route | Sidebar width | Main element width | Page overflow |\n|---|---|---:|---:|---:|\n${layoutRows.join("\n")}\n\n## Read-only configuration findings\n\n- **Authentication storage:** the app initializes Redux auth from localStorage keys \`token\`, \`userInfo\`, and \`companyInfo\`. The audit seeds these values before page scripts execute; API calls are intercepted. These are synthetic values and do not validate backend authentication.\n- **Admin permissions:** synthetic Admin state grants all permission codes declared in \`src/types/adminPermissions.ts\` so guarded Admin routes can be measured.\n- **RTL:** no app-wide \`dir="rtl"\`, MUI RTL theme direction, RTL styling plugin, or i18n setup was found in source/config. Arabic-script text exists in comments and a small number of source strings (including a profile welcome string); there is no evident RTL UI mode.\n- **MUI breakpoints:** \`createTheme\` aligns MUI defaults to Tailwind: xs 0, sm 640, md 768, lg 1024, xl 1280 CSS pixels. Tailwind's 2xl breakpoint remains 1536px.\n- **Tailwind breakpoints:** no custom screen breakpoints were found; defaults apply: sm 640, md 768, lg 1024, xl 1280, 2xl 1536 CSS pixels. The project has a separate 639px media query in \`src/index.css\`.\n- **Admin permission fixture codes:** ${adminPermissions.length} permission codes were loaded from the source type.\n\n${skippedNotes}\n`
   const reportWithOverflowDetails = report.replace(
      "\n## User/company layout measurements at 390px",
      `\n## Overflowing elements by route and width\n\n${overflowDetailsTable}\n\n## User/company layout measurements at 390px`
   )
   await writeFile(baselinePath, reportWithOverflowDetails, "utf8")
}

const main = async () => {
   const routes = await readRoutes()
   const adminPermissions = await readAdminPermissions()
   if (!routes.length) throw new Error("No routes were discovered in route config.")

   console.log(`Discovered ${routes.length} routes:`)
   for (const route of routes) {
      console.log(`  [${route.group}] ${route.path}`)
   }

   await mkdir(screenshotsDirectory, { recursive: true })
   const port = await reservePort()
   baseUrl = `http://127.0.0.1:${port}`
   const server = startServer(port)
   let browser

   try {
      await waitForServer(server)
      browser = await chromium.launch({ headless: true })
      const warmupPage = await browser.newPage({
         viewport: { width: widths[0], height }
      })
      await warmupPage.goto(`${baseUrl}/login`, {
         waitUntil: "domcontentloaded",
         timeout: 120_000
      })
      await warmupPage.close()

      const results = []
      const rolePages = new Map()
      const contexts = []

      for (const role of ["public", "user", "company", "admin"]) {
         const context = await browser.newContext({
            viewport: { width: widths[0], height }
         })
         contexts.push(context)
         const roleState = authForRole(role, adminPermissions)
         await context.addInitScript(state => {
            localStorage.removeItem("token")
            localStorage.removeItem("userInfo")
            localStorage.removeItem("companyInfo")
            if (!state) return
            localStorage.setItem("token", "responsive-audit-token")
            if (state.userInfo) {
               localStorage.setItem("userInfo", JSON.stringify(state.userInfo))
            }
            if (state.companyInfo) {
               localStorage.setItem(
                  "companyInfo",
                  JSON.stringify(state.companyInfo)
               )
            }
         }, roleState)

         const page = await context.newPage()
         const pageErrors = []
         let activeRoute
         await mockApiResponses(page, adminPermissions, () => activeRoute)
         page.on("pageerror", error => pageErrors.push(error.message))
         page.on("console", message => {
            const text = message.text()
            if (
               message.type() === "error" &&
               (text.includes("Error handled by React Router") ||
                  text.includes("React Router caught the following error"))
            ) {
               pageErrors.push(text.split("\n")[0])
            }
         })
         rolePages.set(role, {
            page,
            pageErrors,
            setActiveRoute: route => {
               activeRoute = route
            }
         })
      }

      for (const route of routes) {
         const { page, pageErrors, setActiveRoute } = rolePages.get(route.role)
         setActiveRoute(route)
         pageErrors.length = 0
         let navigationReason
         try {
            await page.goto(`${baseUrl}${route.samplePath}`, {
               waitUntil: "domcontentloaded",
               timeout: 30_000
            })
            await page.waitForFunction(
               () => !document.body.innerText.includes("Loading page..."),
               null,
               { timeout: 3_000 }
            )
            await page.waitForTimeout(250)
            if (pageErrors.length) {
               navigationReason = `page runtime error: ${pageErrors[0]}`
            }
         } catch (error) {
            navigationReason =
               error instanceof Error
                  ? `page did not finish rendering: ${error.message}`
                  : "page did not finish rendering"
         }

         for (const width of widths) {
            await page.setViewportSize({ width, height })
            let reason = navigationReason
            const errorCount = pageErrors.length
            await page.waitForTimeout(200)

            const measurement = await measurePage(page)
            if (!reason && measurement.pathname !== route.samplePath) {
               reason = `redirected to ${measurement.pathname || "/"}`
            }
            if (!reason && measurement.bodyTextLength === 0) {
               reason = "page rendered without visible text"
            }
            if (!reason && measurement.hasRouterError) {
               reason = "React Router error boundary rendered"
            }
            if (!reason && pageErrors.length > errorCount) {
               reason = `page runtime error: ${pageErrors[errorCount]}`
            }

            await page.screenshot({
               path: path.join(screenshotsDirectory, screenshotName(route, width)),
               animations: "disabled"
            })
            results.push({ route, width, measurement, skipped: Boolean(reason), reason })
            console.log(
               `${route.path} @ ${width}px: ${
                  reason
                     ? `SKIPPED (${reason})`
                     : measurement.overflow
                       ? `OVERFLOW(${measurement.overflow}px)`
                       : "PASS"
               }`
            )
         }
      }

      for (const context of contexts) await context.close()
      await writeBaseline(routes, results, adminPermissions)
      console.log(`\nBaseline: ${path.relative(frontRoot, baselinePath)}`)
      console.log(`Screenshots: ${path.relative(frontRoot, screenshotsDirectory)}`)
   } finally {
      await browser?.close()
      server.kill()
   }
}

main().catch(error => {
   console.error(error)
   process.exitCode = 1
})
