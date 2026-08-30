from pathlib import Path
import re

project_path = Path("ios/Discourse.xcodeproj/project.pbxproj")
project = project_path.read_text()

if project.count("PRODUCT_BUNDLE_IDENTIFIER = org.discourse.DiscourseApp;") != 2:
    raise SystemExit("Unexpected main app bundle identifier count")
if project.count("PRODUCT_BUNDLE_IDENTIFIER = org.discourse.DiscourseApp.ShareExtension;") != 2:
    raise SystemExit("Unexpected share extension bundle identifier count")

project = project.replace(
    "PRODUCT_BUNDLE_IDENTIFIER = org.discourse.DiscourseApp.ShareExtension;",
    "PRODUCT_BUNDLE_IDENTIFIER = me.senin.mobile.ShareExtension;",
)
project = project.replace(
    "PRODUCT_BUNDLE_IDENTIFIER = org.discourse.DiscourseApp;",
    "PRODUCT_BUNDLE_IDENTIFIER = me.senin.mobile;",
)

project, style_count = re.subn(
    r"^(\s*)CODE_SIGN_STYLE = Manual;$",
    r"\1CODE_SIGN_STYLE = Automatic;",
    project,
    flags=re.MULTILINE,
)
if style_count != 4:
    raise SystemExit(f"Unexpected manual signing count: {style_count}")

project, team_count = re.subn(
    r'^\s*"?DEVELOPMENT_TEAM(?:\[sdk=iphoneos\*\])?"? = 6T3LU73T8S;\n',
    "",
    project,
    flags=re.MULTILINE,
)
if team_count != 8:
    raise SystemExit(f"Unexpected Discourse team setting count: {team_count}")

project, profile_count = re.subn(
    r'^\s*(?:PROVISIONING_PROFILE|PROVISIONING_PROFILE_SPECIFIER|"PROVISIONING_PROFILE_SPECIFIER\[sdk=iphoneos\*\]") = .*org\.discourse\..*;\n',
    "",
    project,
    flags=re.MULTILINE,
)

# One legacy provisioning profile UUID does not contain the bundle identifier.
project, uuid_profile_count = re.subn(
    r'^\s*PROVISIONING_PROFILE = "8a5dde79-abbd-4707-a921-2b4412ef65ad";\n',
    "",
    project,
    flags=re.MULTILINE,
)

if profile_count != 8 or uuid_profile_count != 1:
    raise SystemExit(
        f"Unexpected Discourse provisioning profile counts: {profile_count}, {uuid_profile_count}"
    )

project, identity_count = re.subn(
    r'^\s*(?:CODE_SIGN_IDENTITY|"CODE_SIGN_IDENTITY\[sdk=iphoneos\*\]") = "iPhone (?:Developer|Distribution)";\n',
    "",
    project,
    flags=re.MULTILINE,
)
if identity_count != 6:
    raise SystemExit(f"Unexpected explicit code signing identity count: {identity_count}")

for forbidden in (
    "org.discourse.DiscourseApp",
    "6T3LU73T8S",
    "match AdHoc org.discourse",
    "match AppStore org.discourse",
    "8a5dde79-abbd-4707-a921-2b4412ef65ad",
):
    if forbidden in project:
        raise SystemExit(f"Upstream signing identity remains: {forbidden}")

project_path.write_text(project)

entitlements_path = Path("ios/Discourse/Discourse.entitlements")
entitlements = entitlements_path.read_text()
aps_block = "\t<key>aps-environment</key>\n\t<string>development</string>\n"
if aps_block not in entitlements:
    raise SystemExit("Expected inherited APNs entitlement was not found")
entitlements = entitlements.replace(aps_block, "", 1)
entitlements_path.write_text(entitlements)
