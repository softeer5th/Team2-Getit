package com.softeer5.uniro_backend.univ;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Univ {
	@Id
	private Long id;
	@Column(length = 20)
	private String name;
	@Column(length = 200)
	private String imageUrl;

}
