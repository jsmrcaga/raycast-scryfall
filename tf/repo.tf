module repo {
  source = "git@github.com:jsmrcaga/terraform-modules//github-repo?ref=v0.1.0"

  github = {
    token = var.github_token
  }

  name = "raycast-scryfall"
  description = "Search Magic: The Gathering cards using Scryfall from the comfort of Raycast"
  topics = ["productivity", "raycast", "mtg"]

  visibility = "public"
}
