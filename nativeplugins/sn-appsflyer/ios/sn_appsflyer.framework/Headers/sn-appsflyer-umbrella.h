#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "AppsFlyerAttribution.h"
#import "AppsFlyerCrossPromotionHelper.h"
#import "AppsFlyerDeepLink.h"
#import "AppsFlyerDeepLinkObserver.h"
#import "AppsFlyerDeepLinkResult.h"
#import "AppsFlyerLib.h"
#import "AppsFlyerLinkGenerator.h"
#import "AppsFlyerShareInviteHelper.h"
#import "SnUniAppsFlyerModule.h"
#import "SnUniAppsFlyerProxy.h"

FOUNDATION_EXPORT double sn_appsflyerVersionNumber;
FOUNDATION_EXPORT const unsigned char sn_appsflyerVersionString[];

