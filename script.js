// Function to claim the daily reward
function claimDailyReward() {
    fetch('/claim_daily_reward')
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            // Update the timer and disable the button if necessary
            document.getElementById('claim-reward').disabled = true;
            startClaimTimer();
        })
        .catch(error => alert("Error claiming reward"));
}

// Function to handle watching an ad for different ad scripts
function watchAd(adId) {
    const adContainer = document.getElementById(`ad-container-${adId}`);

    // Show the ad loading message initially
    adContainer.innerHTML = '<div class="ad-placeholder">Ad is loading...</div>';

    // Call different ad scripts based on the adId
    switch(adId) {
        case 1:
            showGoogleAd(adContainer);  // For ad 1, use Google Ad
            break;
        case 2:
            showUnityAd(adContainer);  // For ad 2, use Unity Ad
            break;
        case 3:
            showAdMobAd(adContainer);  // For ad 3, use AdMob Ad
            break;
        case 4:
            showFacebookAd(adContainer);  // For ad 4, use Facebook Ad
            break;
        case 5:
            showVungleAd(adContainer);  // For ad 5, use Vungle Ad
            break;
        case 6:
            showChartboostAd(adContainer);  // For ad 6, use Chartboost Ad
            break;
        case 7:
            showTapjoyAd(adContainer);  // For ad 7, use Tapjoy Ad
            break;
        case 8:
            showInMobiAd(adContainer);  // For ad 8, use InMobi Ad
            break;
        case 9:
            showAdColonyAd(adContainer);  // For ad 9, use AdColony Ad
            break;
        case 10:
            showIronSourceAd(adContainer);  // For ad 10, use IronSource Ad
            break;
        default:
            alert("Invalid ad ID");
            return;
    }

    // Disable the button for 2 hours after watching the ad
    document.getElementById(`ad_${adId}`).disabled = true;
    startAdTimer(adId);
}

// Simulated ad functions for different ad networks (replace with actual API calls)
function showGoogleAd(adContainer) {
    // Google Ad Script
    (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "ca-pub-XXXXX", // Replace with your AdMob client ID
        enable_page_level_ads: true
    });
    adContainer.innerHTML = '<div class="ad-placeholder">Google Ad successfully loaded.</div>';
}

function showUnityAd(adContainer) {
    // Unity Ad Script
    if (typeof unityAds !== "undefined") {
        unityAds.show('video', {
            videoCompleted: function() {
                adContainer.innerHTML = '<div class="ad-placeholder">Unity Ad successfully watched.</div>';
            },
            videoFailed: function() {
                adContainer.innerHTML = '<div class="ad-placeholder">Unity Ad failed to load.</div>';
            }
        });
    } else {
        adContainer.innerHTML = '<div class="ad-placeholder">Unity Ads not available.</div>';
    }
}

function showFacebookAd(adContainer) {
    // Facebook Ad Script
    if (FBInstant) {
        FBInstant.initializeAsync().then(function() {
            FBInstant.getRewardedVideoAsync().then(function(rewardedVideo) {
                rewardedVideo.showAsync().then(function() {
                    adContainer.innerHTML = '<div class="ad-placeholder">Facebook Ad successfully watched.</div>';
                }).catch(function(err) {
                    adContainer.innerHTML = '<div class="ad-placeholder">Facebook Ad failed to load.</div>';
                });
            });
        });
    } else {
        adContainer.innerHTML = '<div class="ad-placeholder">Facebook Audience Network is not initialized.</div>';
    }
}

function showVungleAd(adContainer) {
    // Vungle Ad Script
    if (window.Vungle) {
        Vungle.loadAd('your-ad-placement-id').then(() => {
            Vungle.showAd().then(() => {
                adContainer.innerHTML = '<div class="ad-placeholder">Vungle Ad successfully watched.</div>';
            }).catch((err) => {
                adContainer.innerHTML = '<div class="ad-placeholder">Vungle Ad failed to load.</div>';
            });
        });
    } else {
        adContainer.innerHTML = '<div class="ad-placeholder">Vungle Ads not available.</div>';
    }
}

function showChartboostAd(adContainer) {
    // Chartboost Ad Script
    if (window.Chartboost) {
        Chartboost.showInterstitial('your-ad-spot-id').then(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">Chartboost Ad successfully watched.</div>';
        }).catch(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">Chartboost Ad failed to load.</div>';
        });
    } else {
        adContainer.innerHTML = '<div class="ad-placeholder">Chartboost Ads not available.</div>';
    }
}

function showTapjoyAd(adContainer) {
    // Tapjoy Ad Script
    if (window.Tapjoy) {
        Tapjoy.requestTapjoyInterstitialAd().then(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">Tapjoy Ad successfully watched.</div>';
        }).catch(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">Tapjoy Ad failed to load.</div>';
        });
    } else {
        adContainer.innerHTML = '<div class="ad-placeholder">Tapjoy Ads not available.</div>';
    }
}

function showInMobiAd(adContainer) {
    // InMobi Ad Script
    if (window.InMobi) {
        InMobi.showAd('your-placement-id').then(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">InMobi Ad successfully watched.</div>';
        }).catch(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">InMobi Ad failed to load.</div>';
        });
    } else {
        adContainer.innerHTML = '<div class="ad-placeholder">InMobi Ads not available.</div>';
    }
}

function showAdColonyAd(adContainer) {
    // AdColony Ad Script
    if (window.AdColony) {
        AdColony.showRewardedAd('your-zone-id').then(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">AdColony Ad successfully watched.</div>';
        }).catch(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">AdColony Ad failed to load.</div>';
        });
    } else {
        adContainer.innerHTML = '<div class="ad-placeholder">AdColony Ads not available.</div>';
    }
}

function showIronSourceAd(adContainer) {
    // IronSource Ad Script
    if (window.IronSource) {
        IronSource.showInterstitialAd().then(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">IronSource Ad successfully watched.</div>';
        }).catch(() => {
            adContainer.innerHTML = '<div class="ad-placeholder">IronSource Ad failed to load.</div>';
        });
    } else {
        adContainer.innerHTML = '<div class="ad-placeholder">IronSource Ads not available.</div>';
    }
}

// Timer for ad watch cooldown
function startAdTimer(adId) {
    let nextAdTime = 2 * 60 * 60 * 1000; // 2 hours cooldown for the ad button
    setTimeout(() => {
        document.getElementById(`ad_${adId}`).disabled = false;
    }, nextAdTime);
}

// Function to toggle between sections in the footer
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
}

// Submit withdrawal form
function submitWithdraw(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    fetch('/withdraw', {
        method: 'POST',
        body: form,
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById('withdraw-status').textContent = 'Withdrawal pending';
    })
    .catch(error => alert('Error submitting withdrawal'));
}

// Initial setup: Show home section by default
document.addEventListener('DOMContentLoaded', function() {
    showSection('home');
});
