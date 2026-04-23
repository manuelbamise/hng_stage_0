-- CreateIndex
CREATE INDEX "Profile_gender_idx" ON "Profile"("gender");

-- CreateIndex
CREATE INDEX "Profile_country_id_idx" ON "Profile"("country_id");

-- CreateIndex
CREATE INDEX "Profile_age_group_idx" ON "Profile"("age_group");

-- CreateIndex
CREATE INDEX "Profile_age_idx" ON "Profile"("age");

-- CreateIndex
CREATE INDEX "Profile_gender_probability_idx" ON "Profile"("gender_probability");

-- CreateIndex
CREATE INDEX "Profile_country_probability_idx" ON "Profile"("country_probability");

-- CreateIndex
CREATE INDEX "Profile_created_at_idx" ON "Profile"("created_at");
