package com.wobuxiangjie

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  private val mReactNativeHost: ReactNativeHost =
    object : DefaultReactNativeHost(this) {
      override fun getUseDeveloperSupport(): Boolean = false
      override fun getPackages(): List<ReactPackage> =
        PackageList(this).packages.apply {}
      override fun getJSMainModuleName(): String = "index"
      override val isHermesEnabled: Boolean = false
    }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, mReactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
