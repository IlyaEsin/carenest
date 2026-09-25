using CareNest.Identity.Accounts;

namespace CareNest.Identity.Tests;

public class EmailLoginTests
{
    [Fact]
    public void Normalize_trims_and_lowercases() => EmailLogin.Normalize("  Anna.P@Example.TEST ").ShouldBe("anna.p@example.test");

    [Fact]
    public void Display_name_is_the_local_part() => EmailLogin.DisplayNameFrom("anna.p@example.test").ShouldBe("anna.p");

    [Fact]
    public void Display_names_are_trimmed_and_capped()
    {
        DisplayNames.Normalize("  Anna  ").ShouldBe("Anna");
        DisplayNames.Normalize(null).ShouldBe("");
        DisplayNames.Normalize(new string('a', 150)).Length.ShouldBe(DisplayNames.MaxLength);
    }
}
