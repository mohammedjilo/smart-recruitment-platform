import assert from "node:assert/strict"
import test from "node:test"
import React from "react"
import { AppErrorBoundary } from "../src/components/common/AppErrorBoundary.ts"

test("creates a safe fallback state when a child throws during render", () => {
   const nextState = AppErrorBoundary.getDerivedStateFromError(new Error("render crash"))

   assert.equal(nextState.hasError, true)
   assert.equal(nextState.error?.message, "render crash")

   const boundary = new AppErrorBoundary({
      children: React.createElement("div", null, "safe render")
   })
   boundary.state = {
      hasError: true,
      error: new Error("render crash")
   }

   const fallback = boundary.render()
   assert.equal(fallback.props.role, "alert")
   assert.equal(fallback.props["aria-live"], "assertive")
})

test("renders children normally when the tree is healthy", () => {
   const boundary = new AppErrorBoundary({
      children: React.createElement("div", null, "safe render")
   })

   assert.equal(boundary.render(), boundary.props.children)
   assert.equal(boundary.props.children.props.children, "safe render")
})
